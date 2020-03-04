module.exports = {
    name: "ping",
    description: "Test connection to Discord's sockets.",
    async handler() {
        const m = await this.this.send("Ping!", this.msg.channel)
       
        var embed = new this.this.Discord.RichEmbed();
        embed.setColor("#007aff")
      //  .setTitle(`Response for command`)
        .setDescription(`Pong! Latency is ${m.createdTimestamp - this.msg.createdTimestamp}ms. API Latency is ${Math.round(this.this.client.ping)}ms`)
        .setTimestamp()
        .setFooter(this.this.client.user.username, this.this.client.user.displayAvatarURL)

        m.edit('', embed);
        return null;
    }
}