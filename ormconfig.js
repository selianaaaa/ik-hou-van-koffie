export const connectionSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "pass123",
  database: "postgres",
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
  cli: {
    migratiosDir: "src/migrations",
  },
})
