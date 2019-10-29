class Bot {
    constructor({name, prefix, token, commands, owners}) {
        this.name = name || 'Bot';
        this.prefix = prefix || 'bot';
        this.token = token || "";
        this.variables = {};
        this.commands = commands || {};
        this.owners = owners || [];

        if(this.token == "") {
            throw Error("Set a token!")
        }

        if(!this.owners.length) {
            throw Error("Add owner IDs to the Bot class!")
        }
        
        const Discord = require('discord.js');
        this.client = new Discord.Client();



        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
        });
        this.client.login(this.token);
        this.client.on('message', async msg => {
            //console.log(msg.content)
            const parse = this.parseMessage(msg);
            if (parse.hasOwnProperty("status") && parse.status) {
                switch (parse.type) {
                    case 'function':
                      // return msg.reply(`Function name ${parse.name} requested with args ${parse.args}`)
                       return this.run(parse.name, msg, parse.args).then((data) => {
                           return msg.reply(data);
                       }).catch((e) => {
                           console.log(e);
                           if(e == 404) {
                               return msg.reply(`command ${parse.name}() doesn't exist!`)
                           }
                           return msg.reply("Something went wrong!");
                       });
                    case 'function_info':
                       return msg.reply(`Function info for ${parse.name}`)
                    case 'prefix':
                       return msg.reply(parse.data)
                    case 'variable':
                       return msg.reply(`Variable name ${parse.name} requested`)
                    case null: 
                        return console.log("Wasn't able to parse that..."+ msg.content)
                    default:
                        break;
                        
                }

            } else if(!parse.status) {
                switch (parse.type) {
                    case 'function':
                        return msg.reply("I'm having some trouble parsing that...")
                    case null:
                        return msg.reply("Hey, you've triggered my prefix, anything I can help you with?")
                    case "syntax":
                        return msg.reply(parse.error);
                    default:
                        break;
                        //return console.log(parse);
                }
                
            }
        });
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
            var functest = ending.match(/\.\w+\(([^)]*)\)/g);
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


                const rightBracket = this.rightBracketIndex(parseArgs);


                if (rightBracket === false) {

                    if (!ending.includes("()")) {
                        return {
                            status: false,
                            type: null,
                            error: "That isn't a function"
                        }
                    }

                }

                const args = ((args) => {
                    return JSON.parse(`[${args.join("").substring(1, rightBracket)}]`);
                })(parseArgs)
                console.log("args", args);




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
        
            if(!this.commands.hasOwnProperty(command)) {
                return reject(404);
            }

            try {
               var res = await this.commands[command].call({this: this, msg, isAdmin: ((user) => {
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