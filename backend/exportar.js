import mysqldump from "mysqldump";

mysqldump({
  connection: {
    host: "localhost",
    user: "mantenimiento_user",
    password: "TU_PASSWORD",
    database: "mantenimiento_db",
  },
  dumpToFile: "./backup.sql",
});
