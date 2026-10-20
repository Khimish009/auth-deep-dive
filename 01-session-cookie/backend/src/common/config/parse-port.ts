export function parsePort(rawPort: string, variableName: string): number {
  const port = Number(rawPort);

  if (
    !/^\d+$/.test(rawPort) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      `Invalid ${variableName}_PORT: expected an integer between 1 and 65535`,
    );
  }

  return port;
}
