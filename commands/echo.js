module.exports = {
    name: "echo",
    description: "Takes a ton of string arguments and spaces them together.",
    arguments: {
        typeof: "string"
    },
    handler(args) {
        return args.join(" ")
    }
}