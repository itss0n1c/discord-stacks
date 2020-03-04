module.exports = {
    name: "getuser",
    description: "Gets the user by either @, id, or name",
    handler(args) {
        if(typeof args[0] !== 'undefined') {
            const users = this.this.client.users
            //console.log(users)
            var user;
            if(typeof args[0] === 'number') { // by id
                
                if(args[0].toString().length > 10) {
                   // console.log("ok")
                    return `This ID won't work, put quotations around it.`
                }
                 user = users.get(args[0])
              //  console.log(user, args[0].toString())
            } else if(typeof args[0] == 'string') {
                if(!isNaN(args[0])) {
                    console.log("found an id", isNaN(args[0]))
                    user = users.get(args[0])
                    console.log(user);
                } else if(args[0].match(/<@(![\d].+)>/gm)) { // by @
                     user = this.this.client.users.get(args[0].replace("<@!", "").replace(">", "").toString())
                } else { // by name
                   // console.log("by name", args[0])
                     user = this.this.client.users.find('username', args[0])
                    //console.log(user);
                }
            }
            //console.log(user);
            var avatarIsNotUrl = false;
            try {
                new URL(user.avatar);
            } catch(e) {
                avatarIsNotUrl = true;
                //console.log(e);
            }
            return `\`\`\`json\n${JSON.stringify({
                id: user.id,
                tag: user.tag,
                avatar: (avatarIsNotUrl ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : user.avatar),
                //avatar: (url.host ),
                bot: user.bot
            }, null, 4)}\`\`\``
        }
    }
}