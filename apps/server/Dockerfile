# syntax=docker/dockerfile:1
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN useradd -r -u 1001 appuser
COPY --from=builder /app/target/agendapets.jar app.jar
USER appuser
ENV PORT=10000
EXPOSE 10000
ENTRYPOINT ["sh", "-c", "exec java -jar /app/app.jar --server.port=${PORT}"]
