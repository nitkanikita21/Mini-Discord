const readline = require('readline');
const Discord = require('discord.js')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const fonts = {
    black: "\u001b[30m",
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    blue: "\u001b[34m",
    magenta: "\u001b[35m",
    cyan: "\u001b[36m",
    white: "\u001b[37m",
    
    bg_black: "\u001b[40m",
    bg_red: "\u001b[41m",
    bg_green: "\u001b[42m",
    bg_yellow: "\u001b[43m",
    bg_blue: "\u001b[44m",
    bg_magenta: "\u001b[45m",
    bg_cyan: "\u001b[46m",
    bg_white: "\u001b[47m",

    reset: "\u001b[0m",

    bold: "\u001b[1m",
    underline: "\u001b[4m",
    reversed: "\u001b[7m",
}

const options = require('./config.json')
var menu_mode = 4
var cashe = {
    servers:null,
    channels:null,
    users:[],
    other:null
}
const menu_list = 'Выбор меню:\n'+fonts.bold+fonts.cyan+'0. '+fonts.reset+"Выбрать сервер\n"+fonts.bold+fonts.cyan+'1. '+fonts.reset+"Выбрать канал\n"+fonts.bold+fonts.cyan+'2. '+fonts.reset+"Выбрать юзера по айди\n"+fonts.bold+fonts.cyan+'3. '+fonts.reset+"Выбрать юзера со списка\n"
//false= chat; 0 = search server; 1 = search channel; 2 = выбор меню; 4 = ввод токена; 3 = выбор юзера для лс ; 5 = чат лс ; 6 = лист юзеров
rl.setPrompt(options.prompt)

var messages = []
var hs_msg = []
const display = {
    display:()=>{
        console.clear()
        var list = messages.join('\n')
        console.log(list)
        rl.prompt(true)
    },
    clear:()=>{
        console.clear()
    },
    info:(message)=>{
        console.log(fonts.cyan+"Info: "+fonts.yellow+message+fonts.reset)
    },
    system:(message)=>{
        console.log(fonts.reversed+"system"+fonts.reset+": "+fonts.yellow+message+fonts.reset)
    },
    warn:(message)=>{
        console.log(fonts.green+"warn: "+fonts.yellow+message+fonts.reset)
    }
}
const client = new Discord.Client()
var token = null
client.on('ready',()=>{
    display.clear()
    clearInterval(cashe.other)
    cashe.other = null
    console.log(fonts.bold+fonts.cyan+process.title+' v'+options.version+fonts.reset)
    console.log('\n=========================\n'+fonts.bold+fonts.blue+options.prefix+'exit - выход\n'+options.prefix+'menu - меню\n'+options.prefix+'v - узнать версию\n'+options.prefix+'ac - ваш аккаунт'+fonts.reset+'\n=========================')
    console.log(menu_list)
    menu_mode = 2
})
var login_discord = function(){
    if(token === null)return
    let loading = setInterval(() => {
        var step = loader[anim_step%loader.length]
        display.clear()
        console.log('                            '+fonts.underline+fonts.green+'Вход в систему \n                        Подождите пожалуйста!'+fonts.reset)
        console.log('\n \n \n \n                                 '+fonts.green+'['+fonts.bold+fonts.white+step+fonts.reset+fonts.green+']')
        anim_step++
    }, 100)
    cashe.other = loading
    client.login(token).catch(error=>{
        console.log(fonts.bold+fonts.red+'Неудалось ввойти в аккаунт, проверьте соидинение!')
        clearInterval(cashe.other)
        setTimeout(() => {
            login_discord()
        }, 2000);
    }).then(()=>{
        console.log("Ноисе")
    })
}

var here_server  = null
var here_channel = null
var here_channel_obj = null
var here_voice = null
var here_ls = null
var here_server_obj = null
var loader = ['/','-','\\','|']
var anim_step = 0
display.clear()

console.log(fonts.bold+fonts.cyan+process.title+' v'+options.version+fonts.reset+'\n=========================')

process.title = 'Mini-Discord'

client.on('message',message=>{
    if(message.channel.type === 'dm'){
        if(message.author !== here_ls&&message.author.id !== client.user.id){
            console.log('\n'+fonts.bold+fonts.cyan+'Cообщение от '+fonts.bold+fonts.blue+message.author.tag+fonts.reset)
            if(cashe.users.includes(message.author) === false){
                cashe.users.push(message.author)
            }
        }
        if(menu_mode === 5){
            if(message.author.id === here_ls.id){
                messages.push('['+fonts.green+message.author.username+fonts.reset+'] '+message.cleanContent)
                hs_msg[message.author.id].push('['+fonts.green+message.author.username+fonts.reset+'] '+message.cleanContent)
                display.display()
            }
            return
        }
        if(menu_mode !== 5){
            if(hs_msg[message.author.id] === undefined){
                hs_msg[message.author.id] = []
            }
            hs_msg[message.author.id].push('['+fonts.green+message.author.username+fonts.reset+'] '+message.cleanContent)
            return
        }
    }
    var nick = ''
    if(message.member.nickname === null){
        nick = message.author.username
    }
    if(message.member.nickname !== null){
        nick = message.member.nickname
    }
    if(hs_msg[message.channel.id] === undefined){
        hs_msg[message.channel.id] = []
    }
    if(hs_msg[message.channel.id] === undefined){
        hs_msg[message.channel.id] = []
    }
    var parsecontent = message.cleanContent
    if(message.mentions.users.array().includes(client.users)=== true){
        parsecontent = `${fonts.bold+fonts.bg_yellow}||${fonts.reset}${parsecontent}`
    }
    hs_msg[message.channel.id].push('['+fonts.green+nick+fonts.reset+'] '+parsecontent)
    if(message.channel.id !== here_channel)return
    messages.push('['+fonts.green+nick+fonts.reset+'] '+parsecontent)
    here_channel_obj = message.channel
    here_server_obj = message.guild
    display.display()
})
const ls = {
    here_user: ()=>{
        return  here_ls.username
    },
    search: async (id)=>{
        here_ls = await client.fetchUser(id)
        display.clear()
        await console.log(ls.here_user())
        menu_mode = 5
        messages = []
        cashe.users.push(here_ls)
        if(hs_msg[id]!== undefined){
            messages.unshift(hs_msg[id].join('\n'))
            console.log(messages.join('\n'))
        }
        process.title = '@'+here_ls.username+' | Mini-Discord'
        if(here_voice !== null){
            process.title = '@'+here_ls.username+' | Mini-Discord | Voice: '+here_voice.name  
        }
        rl.prompt()
    },
    send: async (msg)=>{
        messages.push('['+fonts.green+client.user.username+fonts.reset+'] '+msg)
        await here_ls.send(msg)
        if(hs_msg[here_ls.id] === undefined){
            hs_msg[here_ls.id] = []
        }
        hs_msg[here_ls.id].push('['+fonts.green+client.user.username+fonts.reset+'] '+msg)
        display.display()
    }
}
console.log('Введите токен пожалуйста\n'+fonts.red+fonts.bold+'ВНИМАНИЕ! Если токен недействителен вы не войдёте в систему!'+fonts.reset+fonts.bold+fonts.green+'\n    config - использовать токен с конфига (config.json)'+fonts.reset)
rl.prompt()
//тут обработчик введённого
rl.on('line',line =>{
    if(line.startsWith(options.prefix)&&menu_mode !== 4){
        switch(true){
            case line == options.prefix+'exit':
                process.kill(process.pid)
            break
            case line == options.prefix+'leave':
                if(here_voice === null)return console.log(fonts.cyan+'Вы не подключены к войсу'+fonts.reset)
                if(menu_mode == false){
                    process.title = '#'+here_channel_obj.name+' | Mini-Discord'
                }
                if(menu_mode !== false){
                    process.title = 'Mini-Discord'
                }
                if(menu_mode === 1){
                    process.title = 'Menu | Mini-Discord'
                }
                console.log(fonts.green+here_voice.name+fonts.cyan+' | Отключено'+fonts.reset)
                here_voice.leave()
                here_voice = null
            break
            case line == options.prefix+'debug':
                console.log(fonts.bold+fonts.bg_blue+fonts.cyan+'@нитка'+fonts.reset)
            break
            case line == options.prefix+'account'||line == options.prefix+'ac':
                console.log(fonts.bold+fonts.yellow+'Для смены юзера перезапустите программу!'+fonts.reset)
                console.log(' ')
                console.log(fonts.yellow+fonts.bold+client.user.username+fonts.reset)
            break
            case line == options.prefix+'v'||line == options.prefix+'version':
                console.log(fonts.bold+fonts.cyan+options.version+fonts.reset)
            break
            case line == options.prefix+'menu':
                here_channel_obj = null
                here_ls = null
                display.clear()
                process.title = 'Menu | Mini-Discord'
                if(here_voice !== null){
                    process.title = 'Menu | Mini-Discord | Voice: '+here_voice.name
                }
                console.log(menu_list)
                menu_mode = 2
                rl.prompt()
            break
            case line == options.prefix+'help':
                console.log('\n=========================\n'+fonts.bold+fonts.blue+options.prefix+'exit - выход\n'+options.prefix+'menu - меню\n'+options.prefix+'v - узнать версию\n'+options.prefix+'ac - ваш аккаунт'+fonts.reset+'\n=========================')
                rl.prompt()
            break
        }
        
    }
    if(menu_mode !== false){
        switch(menu_mode){
            case 2:
                if(line == '0'){
                    display.clear()
                    cashe.servers = client.guilds.array()
                    var list = []
                    var i = 0
                    while(cashe.servers[i] !== undefined){
                        list.push(fonts.bold+fonts.cyan+i+'. '+fonts.reset+cashe.servers[i].name+fonts.reset)
                        i++
                    }
                    console.log('Выберите сервер: \n'+list.join('\n'))
                    menu_mode = 0
                    rl.prompt()
                }
                if(line == '1'){
                    if(here_server_obj === null)return display.warn('Сервер не выбран! '+options.prefix+'menu')
                    display.clear()
                    console.log('Выберите канал на сервер:')
                    cashe.channels = here_server_obj.channels.array()
                    cashe.channels = cashe.channels.filter(channel => channel.type !== 'category')
                    var list = []
                    var i = 0
                    while(cashe.channels[i] !== undefined){
                        list.push(fonts.bold+fonts.cyan+i+'. '+fonts.white+'['+fonts.cyan+cashe.channels[i].type+fonts.reset+'] '+cashe.channels[i].name+fonts.reset)   
                        i++
                    }
                    console.log(list.join('\n'))
                    menu_mode = 1
                    rl.prompt()
                }
                if(line == '2'){
                    display.clear()
                    console.log('Введите ниже айди собеседника\n'+fonts.bold+fonts.red+'ВАЖНО! Недействительный айди выдаст ошибку'+fonts.reset)
                    rl.prompt()
                    menu_mode = 3
                }
                if(line == '3'){
                    if(cashe.users[0] === undefined)return console.log(fonts.bold+fonts.red+'У вас нету ниодного чата!'+fonts.reset)
                    var list = []
                    var i = 0
                    while(cashe.users[i] !== undefined){
                        list.push(fonts.bold+fonts.cyan+i+'. '+fonts.white+cashe.users[i].username+fonts.reset)   
                        i++
                    }
                    console.log(list.join('\n'))
                    menu_mode = 6
                    rl.prompt()
                }
            break
            case 0:
                console.log('');
                var index = line
                index = parseInt(line)
                if(index === NaN)return display.system(fonts.red+'NaN 188:25')
                here_server_obj = cashe.servers[index]
                display.clear()
                console.log('Сервер выбран:\n'+fonts.magenta+here_server_obj.name+fonts.reset)
                setTimeout(() => {
                    display.clear()
                    console.log('Выберите канал на сервере:')
                    cashe.channels = here_server_obj.channels.array()
                    cashe.channels = cashe.channels.filter(channel => channel.type !== 'category')
                    var list = []
                    var i = 0
                    while(cashe.channels[i] !== undefined){
                        list.push(fonts.bold+fonts.cyan+i+'. '+fonts.reset+'['+fonts.cyan+cashe.channels[i].type+fonts.reset+'] '+cashe.channels[i].name)   
                        i++
                    }
                    console.log(list.join('\n'))
                    menu_mode = 1
                    rl.prompt()
                }, 800);
            break
            case 1:
                if(line.startsWith(options.prefix)){
                    if(line != options.prefix+'menu')return
                }
                console.log('');
                var index = line
                index = parseInt(line)
                if(index === NaN)return display.system(fonts.red+'NaN 145:25')
                here_channel_obj = cashe.channels[index]
                here_channel = here_channel_obj.id
                messages = []
                if(here_channel_obj.type === 'voice'){
                    if(here_voice !== null)return console.log(fonts.cyan+'Вы подключены к войсу '+fonts.green+here_voice.name+fonts.reset)
                    here_voice = cashe.channels[index]
                    here_channel_obj = null
                    here_channel = null
                    console.log(fonts.green+here_voice.name+fonts.cyan+' | Подключено'+fonts.reset)
                    here_voice.join()
                    process.title ='Menu | Mini-Discord | Voice: '+here_voice.name
                    rl.prompt()
                    return
                }
                if(here_channel_obj.type !== 'voice'){
                    display.clear()
                    console.log('Канал выбран:\n['+fonts.cyan+here_channel_obj.type+fonts.reset+'] '+fonts.magenta+here_channel_obj.name+fonts.reset)
                    setTimeout(() => {
                        display.clear()
                        menu_mode = false
                        process.title = '#'+here_channel_obj.name+' | Mini-Discord'
                        if(here_voice !== null){
                            process.title = '#'+here_channel_obj.name+' | Mini-Discord | Voice: '+here_voice.name
                        }
                        if(hs_msg[here_channel_obj.id] !== undefined){
                            console.log(hs_msg[here_channel_obj.id])
                            messages.unshift(hs_msg[here_channel_obj.id].join('\n'))
                            display.display()   
                        }
                    }, 2000);
                }
            break
            case 4:
                token = line
                if(line === 'config')token = options.token
                if(line.startsWith(options.prefix)){
                    display.clear()
                    console.log('Ввойдите прежде чем вводить команды!\n'+fonts.red+fonts.bold+'ВНИМАНИЕ! Если токен недействителен вы не войдёте в систему!'+fonts.reset)
                    rl.prompt()
                    return 
                }
                if(token === 'your_token'){
                    display.clear()
                    console.log('Токен отсуствует')
                    console.log('Введите токен пожалуйста\n'+fonts.red+fonts.bold+'ВНИМАНИЕ! Если токен недействителен вы не войдёте в систему!'+fonts.reset)
                    rl.prompt()
                    return 
                }
                display.clear()
                login_discord()
            break
            case 3:
                if(line.startsWith(options.prefix)){
                    if(line != options.prefix+'menu')return
                }
                ls.search(line)
            break
            case 5:
                ls.send(line)
                display.display()
            break
            case 6:
                if(line.startsWith(options.prefix)){
                    if(line != options.prefix+'menu')return
                }
                var index = line
                index = parseInt(line)
                if(cashe.users[index] === undefined)return console.log(fonts.bold+fonts.red+'Данного варианта нету!'+fonts.reset)
                ls.search(cashe.users[index])
            break
        }
    }
    if(line.startsWith(options.prefix) === false && menu_mode === false){
        if(here_channel_obj === null)return display.warn("Канал не выбран!")
        try {
            here_channel_obj.send(line)
            display.display()
        } catch (error) {
            display.clear()
            display.system(fonts.red+ error)
        }
    }
})
rl.on('close',()=>{
    if(here_voice !== null){
        here_voice.leave()
    }
})