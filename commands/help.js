module.exports = {
    name: "help",
    description: "Lists available commands and explains what each does",
    handler(args) {
        const self = this.this;
        var cmdsmsg = ""
        //console.log(self);
        Object.keys(self.commands).forEach(i => {
            const cmd = self.commands[i];
            if(cmd.ownerOnly) {
                if(self.owners.includes(this.msg.author.id)) {
                    cmdsmsg += `${cmd.name} - ${(cmd.hasOwnProperty('description') ? cmd.description : 'No description given')}\n\n`
                }
            } else {
                cmdsmsg += `${cmd.name} - ${(cmd.hasOwnProperty('description') ? cmd.description : 'No description given')}\n\n`
            }
        });
        return `Help\nFor arguments info, use \`${self.prefix}.command\`\n\`\`\`${cmdsmsg}\`\`\`\n\n Built with :heart: and <:code:657232206824996891> by <@${self.owners[0]}>\nProject: [https://github.com/itss0n1c/discord-stacks](https://github.com/itss0n1c/discord-stacks)`
    }
}