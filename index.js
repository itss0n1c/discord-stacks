class Bot {
    constructor({name, prefix, token, commands, owners}) {
        this.name = name || 'Bot';
        this.prefix = prefix || 'bot';
        this.token = token || "";
        this.variables = {};
        
        
        this.owners = owners || [];

        if(this.token == "") {
            throw Error("Set a token!")
        }

        if(!this.owners.length) {
            throw Error("Add owner IDs to the Bot class!")
        }
        
        this.Discord = require('discord.js');
        this.client = new this.Discord.Client();

        this.commands =  {};

        const fs = require("fs")
        const path = require("path")
        console.log(__dirname)
        const cmdsDir = fs.readdirSync(path.join(__dirname, "commands"))
        console.log(cmdsDir)
        cmdsDir.forEach((file) => {
            if(file.endsWith(".js")) {
                this.commands[file.replace(".js", "")] = require(`./commands/${file}`);
            }
        })
        
        Object.keys(commands).forEach((key) => {
            this.commands[key] = commands[key];
        })
        console.log(this.commands)
        

          
          this.client.on("guildCreate", guild => {
            
            console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
            this.client.user.setActivity(`on ${this.client.guilds.size} servers`);
          });
          
          this.client.on("guildDelete", guild => {
            console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
            this.client.user.setActivity(`on ${this.client.guilds.size} servers`);
          });

        this.client.on('ready', () => {
            this.client.user.setActivity(`on ${this.client.guilds.size} servers`);
            console.log(`Logged in as ${this.client.user.tag}!`);
        });
        this.client.login(this.token);
        this.client.on('message', async msg => {
            //console.log(msg.content)
            //console.log([msg.channel, msg.id, ])
            const parse = this.parseMessage(msg);
            if (parse.hasOwnProperty("status") && parse.status) {
                switch (parse.type) {
                    case 'function':
                      // return msg.reply(`Function name ${parse.name} requested with args ${parse.args}`)
                       return this.run(parse.name, msg, parse.args).then((data) => {
                           if(data !== null) {
                            return this.send(data, msg.channel);
                           }
                           
                       }).catch((e) => {
                           console.log(e);
                           if(e == 404) {
                               return this.send(`command ${parse.name}() doesn't exist!`, msg.channel)
                           }
                           return this.send("Something went wrong!", msg.channel);
                       });
                    case 'function_info':
                        const cmd = this.commands[parse.name];
                        const embed = this.embed(`Function info for ${parse.name}`);
                        embed.addField("Name", cmd.name, true)
                        embed.addField("Description", cmd.description, false);
                        embed.addField("Owners Only", !!cmd.ownerOnly, true)
                        if (cmd.hasOwnProperty('arguments')) {
                            if(cmd.arguments.hasOwnProperty('typeof')) {
                                embed.addField("Arguments", `All args set to typeof ${cmd.arguments.typeof}`)
                            } else if(typeof cmd.arguments[0] !== 'undefined') {
                                var cmdargs = ""
                                cmd.arguments.forEach((arg, i) => {
                                    cmdargs += `Index '${i}' name is '${arg.name}' with typeof '${arg.typeof}'\n`
                                })
                                embed.addField("Arguments", cmdargs, true)
                            }
                        }
                        
                        //embed.addField("Arguments", `\`\`\`${}\`\`\``)
                        return msg.channel.send('', embed)
                       //return this.send(`Function info for ${parse.name}`, msg.channel)
                    case 'prefix':
                       return this.send(parse.data, msg.channel)
                    case 'variable':
                       return this.send(`Variable name ${parse.name} requested`, msg.channel)
                    case null: 
                        return console.log("Wasn't able to parse that..."+ msg.content)
                    default:
                        break;
                        
                }

            } else if(!parse.status) {
                switch (parse.type) {
                    case 'function':
                        return this.send("I'm having some trouble parsing that...", msg.channel)
                    case null:
                        return this.send("Hey, you've triggered my prefix, anything I can help you with?", msg.channel)
                    case "syntax":
                        return this.send(parse.error, msg.channel);
                    case "failed_args": 
                        return this.send(parse.error, msg.channel);
                    default:
                        break;
                        //return console.log(parse);
                }
                
            }
        });
    }

    
    send(msg, channel) {
        console.log(this.client.user)
        var embed = new this.Discord.MessageEmbed();
        embed.setColor("#007aff")
      //  .setTitle(`Response for command`)
        .setDescription(msg)
        .setTimestamp()
        .setFooter(this.client.user.username, `https://cdn.discordapp.com/avatars/${this.client.user.id}/${this.client.user.avatar}.png?size=256`)

        return channel.send('', embed);
    }
    embed(desc, fields) {
        var embed = new this.Discord.MessageEmbed();
        embed.setColor("#007aff")
        .setDescription(desc)
        .setTimestamp()
        .setFooter(this.client.user.username, this.client.user.displayAvatarURL)
        return embed;
    }

    parseMessage(msg) {
        var message = msg.content;

        if (msg.author.tag == this.client.user.tag) {
            return {
                status: false,
                type: 404,
                error: "That's me!"
            };
        }

        if (!message.startsWith(this.prefix)) {
            return {
                status: false,
                type: 404,
                error: "no match"
            };
        }
       // console.log("message "+ message)

        if (message == this.prefix) {
            //console.log("Hey there!");
            return {
                status: true,
                type: "prefix",
                data: "Hey there!"
            }
            return msg.reply("Hey there!")
        } else if (message.length > this.prefix.length && message.startsWith(this.prefix)) {
            var ending = message.slice(this.prefix.length)
            console.log(ending);

            // check if it's a function
            var functest = ending.match(/\.\w+\((.*)\)/g);
            console.log("functest", functest);
            if (functest !== null) {
                //console.log(functest);
                var func = functest.join("").split(".")[1];
                var funcname = ((func) => {
                    return ((func.match(/(\w+(?=\())/g)) ? func.match(/(\w+(?=\())/g) : null);
                })(func);
                if (funcname == null) {
                    return {
                        status: false,
                        type: 'function',
                        error: "That function is weird. Couldn't complete task."
                    }
                }



                const parseArgs = ((func.match(/(\([\s\S]+\))/gm) !== null) ? func.match(/(\([\s\S]+\))/gm) : []);


                //const rightBracket = this.rightBracketIndex(parseArgs);


               /* if (rightBracket === false) {

                    if (!ending.includes("()")) {
                        return {
                            status: false,
                            type: null,
                            error: "That isn't a function"
                        }
                    }

                }*/
                console.log("func", func)
                console.log("parseArgs", parseArgs)
                const ogargs = parseArgs.slice(0);
                const args = ((args) => {
                    try {
                        console.log(args.join(""))
                        const argmsg = args.join("").replace(/`/g, "")
                        var data = JSON.parse(`[${argmsg.substring(1, argmsg.length -1)}]`);
                        console.log(data);
                    } catch(e) {
                        return [null, e]
                    }
                    return data;
                })(parseArgs)
                console.log("args", args);
                
                if(args.length == 0) {
                    if(ending == `.${funcname}()`) {
                        return {
                            status: true,
                            type: "function",
                            args: [],
                            name: funcname
                        }
                    }
                } else if (args[0] == null) {
                    const argmsg = ogargs.join("").replace(/`/g, "")
                    const data = argmsg.substring(1, argmsg.length -1)
                    console.log(data)
                    return {
                        status: false,
                        type: "failed_args",
                        error: `\`\`\`js\n ${this.prefix}.${funcname}(${data}\`\`\`\n ${args[1]}\n Remember to close all quotations properly!\n`
                    }
                }
                




              
                console.log(args)
                return {
                    status: true,
                    type: "function",
                    args: args,
                    name: funcname
                }

            }

            // check if it's a variable
            var vartest = ending.match(/^(\.\w+(?!=\(\ \w+))$/gm);
            console.log("vartest", vartest);
            if (vartest !== null) {
                console.log(vartest);
                var variable = vartest.join("").split(".")[1];
                if (this.commands.hasOwnProperty(variable)) {
                    return {
                        status: true,
                        type: "function_info",
                        name: variable
                    }
                    return msg.reply(`Are you looking for the function: ${variable}()?`)
                }
                return {
                    status: true,
                    type: "variable",
                    name: variable
                }
                return msg.reply(`${msg.author.tag} asked for a variable ${variable}`);
            }

            if (!!!vartest && !!!functest) {
                if(ending == ".") {
                    return {
                        status: false,
                        type: null
                    }
                }
                return {
                    status: false,
                    type: "syntax",
                    error: `Unable to parse, there must be a syntax error after the "."`
                }
                
                //console.log("what the fuck was that lmao");
               // msg.reply("For some reason, I wasn't able to parse that...")
            }
        }
    }

    rightBracketIndex(args) {
        args = args.join("");
        if (!args.includes(")")) return false;
        for (var i = args.length - 1; i > -1; i--)
            if (args[i] == ")") return i;
        return false;
    }

    
    run(command, msg, args) {
        //const self = this;
        return new Promise( async (resolve, reject) => {
            console.log(this.commands, command)
            if(!this.commands.hasOwnProperty(command)) {
                return reject(404);
            }
            const cmd = this.commands[command];
            if(cmd.ownerOnly) {
              //  console.log( msg.author.id,  this.owners[0])
                if(!this.owners.includes(msg.author.id)) {
                    return resolve('This command is for owners only!')
                }
            }

            var notType = [];
            if(args.length !== 0) { 
                if(cmd.hasOwnProperty('arguments')) { 
                    console.log(this.commands.arguments)
                    if(cmd.arguments.hasOwnProperty('typeof')) {
                        
                        args = args.filter((arg, i) => {
                            if(typeof arg == cmd.arguments.typeof) {
                                return true;
                            } else {
                                console.log("not!", arg, i)
                                notType.push({arg, i, typeof: cmd.arguments.typeof});
                            }
                        })
                        console.log("testing arguments", args);
                    } else if(typeof cmd.arguments[0] !== 'undefined') {
                        var newargs = {};
                        args.forEach((arg, i) => {
                            if(typeof arg == cmd.arguments[i].typeof) {
                                newargs[cmd.arguments[i].name] = arg;
                            } else {
                                notType.push({arg, i, typeof: cmd.arguments[i].typeof})
                            }
                            
                        })
                        args = newargs;
                    }
                }
            } else {
                
                console.log("no arguments!")
            }
            //return;
            console.log(args, notType);
            if(typeof notType !== 'undefined' && notType.length > 0) {
                console.log(notType);
                var warnmsg = "";
                notType.forEach((type) => {
                    warnmsg += `The argument at [${type.i}] in the command ${command} is not typeof ${type.typeof}. Given type ${typeof type.arg}.\n`                    
                })
                const warnings = `\`\`\` ${warnmsg} \`\`\``
                return this.send(warnmsg, msg.channel)
            }

            try {
               var res = await cmd.handler.call({this: this, msg, isAdmin: ((user) => {
                   //console.log(user);
                if(this.owners.includes(user.id)) {
                    return true;
                } else {
                    console.log(this.owners, user.id);
                    return false;
                }
               })(msg.author)}, args);
            } catch(e) {
                return reject(e);
            }

            resolve(res);

        });

    }
}

module.exports = Bot