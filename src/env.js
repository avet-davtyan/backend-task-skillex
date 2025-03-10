export function validateEnvVariables() {
  const requiredEnvVariables = [
    "PORT",
    "MYSQL_HOST",
    "MYSQL_PORT",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
  ];
  const missingEnvVariables =
    requiredEnvVariables
      .filter(variableName => !process.env[variableName]);

  if (missingEnvVariables.length > 0) {
    throw new Error(`Missing ENV variables: ${missingEnvVariables.join(", ")}`);
  }
}