import DotENV from "dotenv";
import Http from "http";
import Koa from "koa";
import KoaRouter from "koa-router";
import koaBodyparser from "koa-bodyparser";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

DotENV.config();

const app = new Koa();
const router = new KoaRouter();

app.use(koaBodyparser());

router.get("/", function (context) {
  context.status = 200;
  context.body = "Pong";
});

app.use(router.routes());

const server = Http.createServer(app.callback());
const socketio = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var files = [];

const fileTemplate = {
  id: "",
  title: "",
  content: "",
};

socketio.on("connection", (socket) => {
  console.log("New Socket Connected: ", socket);

  socket.on("NewFile", (args) => {
    console.log("Request NewFile: ", args);
    const newFile = {
      id: uuidv4(),
      title: args.title,
      content: "",
    };
    files.push(newFile);

    socket.rooms.forEach((room) => {
      if (socket.id !== room) socket.leave(room);
    });
    socket.join(newFile.id);
    console.log(socket.rooms);

    socket.emit("RequestedFile", newFile);
    socketio.sockets.emit(
      "AllFileTitles",
      files.map(({ id, title }) => ({
        id,
        title,
      })),
    );
    console.log("New File Created: ", newFile);
  });

  socket.on("OpenFile", (args) => {
    console.log("Request OpenFile: ", args);
    let file = files.find(({ id }) => id === args.id);
    socket.emit("RequestedFile", file);
  });

  socket.on("UpdateFile", (args) => {
    console.log("Request UpdateFile: ", args);
    let file = files.find(({ id }) => id === args.id);
    file.content = args.content;
    socketio.sockets.except(socket.id).emit("FileUpdated", file);
  });

  socket.on("FetchAllFileTitles", () => {
    console.log("Request FetchAllFileTitles.");
    socket.emit(
      "AllFileTitles",
      files.map(({ id, title }) => ({
        id,
        title,
      })),
    );
  });

  socket.on("disconnect", () => console.log("A Socket Disconnected: ", socket));
});

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on port " + (process.env.PORT || 3000));
});
