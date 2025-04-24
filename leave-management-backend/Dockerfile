# Build stage
FROM maven:3.8.8-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy files needed for build
COPY pom.xml ./
COPY src ./src

# Build application
RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built JAR file from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose the application port
EXPOSE 8083

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]