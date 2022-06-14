import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import "./App.css";
import DOMPurify from "dompurify";

import { ReactMic } from 'react-mic';

const socket = openSocket('http://localhost:3001');

class App extends Component {

    constructor(props) {
        var today = new Date(),
        time = today.getHours() + ':' + today.getMinutes() ;
      
        super(props);
        this.state = {
            channelSelected: '#accueil',
            username : 'invité',
            usertemp : '',
            temp : '',
            tempMessage : '',
            time: time,
            channels: [],
            messages : [],
           dure : new Date().getMinutes(),
            users : [],
            chaine: '<br/>',
            record: false,
         
        }
    

        this.onChange = this.onChange.bind(this);
        this.handlePseudo = this.handlePseudo.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleChannel = this.handleChannel.bind(this);
  
    }



    componentDidMount() {

        socket.on('newuser', (user) => {
            this.setState({
                messages : this.state.messages.concat({
                    channel: this.state.channelSelected,
                    author: 'system',
                    content: user.username + ' a rejoint le channel',
                    to: '',
                    time : this.state.time,
                    chucho: 'no'
                })
            })
        });
        socket.on('renameuser', (user) => {
            this.setState({
                messages : this.state.messages.concat({
                    channel: this.state.channelSelected,
                    author: 'system',
                    content: user.username + ' a changé son pseudo en ' + user.rename,
                    to: '',
                    time : this.state.time,
                    chucho: 'no'
                })
            })
        });


        socket.on('disuser', (user) => {
            this.setState({
                messages : this.state.messages.concat({
                    channel: this.state.channelSelected,
                    author: 'system',
                    content: user.username + ' a quitté le channel',
                    time: user.time,
                    to: '',
                    time : this.state.time,
                    chucho: 'no'
                })
            })
        });
        socket.on('listUsers', (user) => {
            this.setState({users : []});
            for(var i in user) {
                this.setState({users : this.state.users.concat(user[i])});
            }
        })
        socket.on('newmsg', (message) => {
            this.setState({
                messages : this.state.messages.concat({
                    channel: message.messages.messages.channel,
                    author: message.messages.messages.author,
                    content: message.messages.messages.content,
                    to: message.messages.messages.to,
                    time: message.messages.messages.time,
                    chucho: message.messages.messages.chucho
                })
            })

            socket.on("logoff", (user) => {
                console.log(user);
              this.setState ({ 
                  channels: user.channels,
                        tempMessage: {
                            channel: this.state.channelSelected,
                            author: 'system',
                            content: "Le channel  a été supprimé",
                            to: '',
                            time : this.state.time,
                            chucho: 'no'
                        }            
              })
            
                    }) 

        })

        socket.on('listChannels', (channels) => {
            this.setState({channels : []});
            for(var i in channels) {
                this.setState({channels : this.state.channels.concat(channels[i])});
            }
        })


    }
    startRecording = () => {
        this.setState({ record: true });
      }
     
      stopRecording = () => {
        this.setState({ record: false });
      }
      onData(recordedBlob) {
        console.log('chunk of real-time data is: ', recordedBlob);
      }
     
  

    onChange(event) {
        this.setState({ usertemp: event.target.value })
    }

    
    handlePseudo(event) {
        event.preventDefault();
        socket.emit('login', { username : this.state.usertemp })
        this.setState({ username: this.state.usertemp })
    }

    handleChannel(event) {
        var listChan = this.state.channels.filter(channel => channel === '#' + this.state.usertemp);
        this.setState({channelSelected: listChan});
        return false;
    }

    
    commandName(tab, event) {
        socket.emit('rename', {
            username : this.state.username,
            rename : tab[1],
        });
        this.setState({ username: tab[1] });
    }
        
            commandMsg(tab) {
                tab = tab.filter(word => word !== tab[0]);
                this.setState({
                    tempMessage : {
                        channel: this.state.channelSelected,
                        author: this.state.username,
                        content: tab.filter(word => word !== tab[0]).join(' '),
                        to: tab[0],
                        time : this.state.time,
                        chucho : 'yes'
                    }
                }); 
            }
            commandList(tab) {
        this.setState({
            tempMessage: {
                channel: this.state.channelSelected,
                author : 'system',
                content: 'Liste des users : ' + this.state.users.join(' '),
                to: '',
                time : this.state.time,
                chucho: 'no'
            }
        });
        socket.emit('newmessage', { messages: this.state.tempMessage });
            }

            onStop(recordedBlob) {
                console.log('recordedBlob is: ', recordedBlob.blobURL );
                var url = URL.createObjectURL(recordedBlob.blob);
                var audio = "<audio controls src='" + url + "'></audio>";
              
                this.setState({
                    tempMessage: {
                        channel: this.state.channelSelected,
                        author: this.state.username,
                        content: audio,
                        to : '',
                        time: this.state.time,
                        chucho: 'no'
                    }
                });
                socket.emit('newmessage', { messages: this.state.tempMessage });

            }

                        
       commandeChannel(tab) {
             
                    this.setState({
                        tempMessage: {
                        channel: this.state.channelSelected,
                        author : 'system',
                        content: 'Liste des channels : ' + this.state.channels.join(' '),
                        to: '',
                        time : this.state.time,
                        chucho: 'no'
                    }
                });
            
        socket.emit('newmessage', { messages: this.state.tempMessage });

     }
           
     commandCreatetable(chaine) {
        this.setState({
            tempMessage: {
                channel: this.state.channelSelected,
                author : 'system',
                content: 'Table de ' + chaine + ' à ' + chaine + ' créée',
                to: '',
                time : this.state.time,
                chucho: 'no'
            }
        });
        socket.emit('newChannel', { channel: chaine})
        socket.emit('newmessage', { messages: this.state.tempMessage });
    }
    

    commandDelete(tab) {
            var listChan = this.state.channels.filter(channel => channel !== '#'+tab[1]);
        
        console.log(listChan);
        this.setState({
            channels: listChan,
            tempMessage : {
                channel: this.state.channelSelected,
                author: 'system',
                content: 'Le channel ' + tab[1] + ' a été supprimé',
                to: '',
                time : this.state.time,
                chucho: 'no'
            }
        })
          console.log(this.state.tempMessage);
    
    }

    commandCreate(tab) {

        var listChan = this.state.channels.filter(channel => channel === '#' + tab[1]);
        if(listChan.length === 0 ) {
            this.setState({
                tempMessage: {
                    channel: this.state.channelSelected,
                    author: 'system',
                    content: 'Le channel a bien été créé',
                    to: '',
                    time : this.state.time,
                    chucho : 'no'
                }
            });
            socket.emit('newChannel', {
                channel: tab[1]
            })
            socket.emit('newmessage', { messages: this.state.tempMessage });
           


        }     
        if(listChan.length >= 1 ) {
            this.setState({
                tempMessage: {
                    channel: this.state.channelSelected,
                    author: 'system',
                    content: 'Ce channel existe déjà',
                    to: '',
                    time : this.state.time,
                    chucho : 'no'
                }
            });
            socket.emit('newmessage', { messages: this.state.tempMessage });
        }    
        return true;
    }
    commandJoin(tab) {
        this.setState({channelSelected: tab[1]})
    }

   affichageMenbre() {
    return this.state.users.map(user => {
        return <span className="users"> {user} - </span>
    });
}

commandHelp() {
    this.setState({
        tempMessage: {
            channel: this.state.channelSelected,
             author : 'system',
            content: 'Liste des commandes : ' + <br/> + ' pour changer de channel cliquez sur le nom du channel '+ <br/>+' pour envoyer un message a une personne spefique, tapez /msg nom_utilisateur message '+ <br/>+' pour cree un channel tapez /create nom_du_channel '+ <br/>+' pour rejoindre un channel tapez /join nom_du_channel '+ <br/>+'  pour supprimer un channel tapez /delete nom_du_channel '+ <br/>+' pour voir la liste des channels tapez /list '+ <br/>+'  pour voir la liste des utilisateurs tapez /users '+ <br/>+'  pour changer de pseudo tapez /nick nom_du_pseudo.',
            to : '',
            time : this.state.time,
            chucho : 'no'
        }
    });

}

    handleChange(event) {
        this.setState({ temp: event.target.value });
        var tab = event.target.value.split(' ');
        var tabBegin = tab[0].split('');
        if(tab[0] === "/help") {
            this.commandHelp();
            return false;
        }
        if(tab[0] === '/msg') {
            this.commandMsg(tab);
            return false;
        }
        if(tab[0] === '/nick') {
            return false;
        }
        if(tab[0] === '/delete') {
            return false;
        }
        if(tab[0] === '/users'){
            return false; 
        }
        if(tab[0] === '/list') {
            return false;
        }
        if(tab[0] === '/create') {
            return false;
        }
        if(tab[0] === '/join') {
            return false;
        }
        if(tabBegin[0] !== "/") {
            this.setState({
                tempMessage: {
                    channel: this.state.channelSelected,
                    author : this.state.username,
                    content: event.target.value,
                    to: '',
                    time : this.state.time,
                    chucho: 'no'
                }
            })
        }
    }

    handleMessage(event) {
        event.preventDefault();
        var tab = this.state.temp.split(' ');
        if(tab[0] === '/nick') {
            if(tab[1] !== undefined && tab[1] !== '') {
                this.commandName(tab, event);
            }
            this.setState({temp: ''});
            return false;
        }
        if(tab[0] === '/create') {
            if(tab[1] !== undefined && tab[1] !== '') {
                this.commandCreate(tab);
            }
            this.setState({temp: ''});
            return false;
        }
        if(tab[0] === '/join') {
            if(tab[1] !== undefined && tab[1] !== '') {
                this.commandJoin(tab);
            }
        }
        if(tab[0] === '/list') {
            this.commandeChannel(tab);
        }
        if(tab[0] === '/delete') {
            if(tab[1] !== undefined && tab[1] !== '') {
                this.commandDelete(tab);
            }
        }
        if(tab[0] === '/help') {
            this.commandHelp();
        }
        if(tab[0] === '/users') {
            this.commandList(tab);
        }
        socket.emit('newmessage', { messages: this.state.tempMessage });
        this.setState({temp: ''});
    }

    Message() {

        var tab = this.state.messages.filter( messages => messages.channel === this.state.channelSelected);
        return tab.map(message => {
            if(message.author === 'system') {
                return <span className="msg"><strong>{message.content} <br/> {message.time} <br/> </strong></span>
            }
            if(message.to !== '' && message.to === this.state.username) {
                return <span className="msg"><em>{message.author} ta dis </em> : {message.content} <br/> {message.time} <br/> </span>
            }
            if(message.to !== '' && message.author === this.state.username) {
                return <span className="teste"><em> Vous avez chuchoté à {message.to}</em> : {message.content} <br/> {message.time} <br/> </span>
            }
            if(message.author !== 'system' && message.chucho === 'no') {
                return <span className="msg"><strong>{message.author}</strong> : {message.content} <br/>{message.time} <br/>  </span>
            }
            
        });
   }



   Channel() {
       return this.state.channels.map(channel => {
           return <span
                className="chan"
                value={channel}
                onClick={(event) => { this.setState({channelSelected: event.target.getAttribute('value')})}}>
                    {channel} -&nbsp;
                </span>
       })
   }

    render() {

        const {
            showEmojiPicker,
          } = this.state;

        if(this.state.username === 'invité') {
            return (
                <div className="flex justify-center text-center p-5 solid">
                    <div className="username">
                        <h1>Bienvenue sur My_IRC</h1>
                        <div className="p-8">
                            <span className="label">
                                Votre pseudo :
                            </span>
                        </div>

                        <form>
                            <input className='text-sm sm:text-base text-center relative w-full border rounded placeholder-gray-400 focus:border-indigo-400 focus:outline-none py-2 texs' type="text" onChange={ this.onChange}/>
                            <button className="button"  onClick={this.handlePseudo}>Se connecter</button>
                        </form>
                    </div>
                </div>
            )
        }
        if(this.state.username !== '') {
            return (
                <div>
                <div className="App">
                    <div className="flex justify-center py-5">
                        <div className="max-w-sm bg-white border-2 border-gray-300 p-6 rounded-md tracking-wide shadow-lg">
                            <div className="rounded text-center relative -mb-px  px-8">
                               liste des channels <br/>
                                {this.Channel()} <br/>
                            </div>
           
                              <div className="text-center">
                           <form> 
                                <input className='text-sm sm:text-base text-center relative w-full border rounded placeholder-gray-400 focus:border-indigo-400 focus:outline-none py-2 pr-2' type="text" placeholder='cree un nouveau channel ' onChange={this.onChange}/>
                                <button onClick={this.handleChannel}>Envoyer</button>
                           </form>
                                </div>
                         </div>
                    </div>
                    <div className="flex justify-center rounded-lg  p-16 test">
                    <div className="text-center name">
                                <em>Bienvenue { this.state.username } sur le channel {this.state.channelSelected}</em>
                    </div> 
                        <div className="grid place-items-center w-4/5 mx-auto p-10 my-20 sm:my-auto bg-gray-50 border rounded-xl shadow-2xl space-y-5 text-center affiche">
                            <div>   
                                <div id="content">
                                    {this.Message()}
                                    
                                </div>
                            </div>
                        </div>
                    <div className="flex justify-center bas" >

                        <span className="border rounded-lg">
                            <div className="sendForm">
                            <form >
                                    <input  className="" id="msg" value={this.state.temp} onChange={ this.handleChange }/>
                                    <button  className="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition bg-gray-300 rounded-full shadow ripple waves-light hover:shadow-lg focus:outline-none hover:bg-black" onClick={this.handleMessage}>Envoyer</button>
                                </form>
                                <div>
                            <ReactMic
                            record={this.state.record}
                            className="sound-wave"
                            onStop={(e) => this.onStop(e)}
                            onData={this.onData}
                            strokeColor="#000000"
                            mimeType = " audio/mp3" 
                        height={50}
                            backgroundColor="transparent" />
                            <button onClick={this.startRecording} type="button">Start</button>
                            <button onClick={this.stopRecording} type="button">Stop</button>
                        </div>
                            </div>
                        </span>
                    </div>
                </div>
                
                    
                    <div className="bg-grey-200">
                    <footer className="flex flex-wrap items-center justify-between p-3 m-auto">
                        <div className="container mx-auto flex flex-col flex-wrap items-center justify-between">
                            <div className="members">
                                Liste des membres
                            {this.affichageMenbre()}
                            </div>
                        </div>
                    </footer>
                    </div>
              
                </div>
                </div>
                
            )
        }
        return (<p> {this.state.username} est rentré sur le channel</p>);
    }
}

export default App;
