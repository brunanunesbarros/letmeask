import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import arrowDownImg from '../assets/images/arrow-down.png';
import googleIconImg from '../assets/images/google-icon.svg';

import { database } from '../services/firebase';

import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

import '../styles/auth.scss';

export function Home() {
  const history = useHistory();
  const { user, signInWithGoogle, signOutWithGoogle } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [mainElement, setMainElement] = useState<HTMLElement | null>();

  async function handleCreateRoom() {
    if(!user) {
      await signInWithGoogle()
    }

    history.push('/rooms/new')
  }

  async function handleJoimRoom(event: FormEvent) {
    event.preventDefault();

    if (roomCode.trim() === '') {
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      toast.error('Esta sala não existe!');
      return;
    }
    if (roomRef.val().endedAt) {
      toast.error('Esta sala está fechada.');
      return;
    }

    history.push(`rooms/${roomCode}`);
  }

  function scrollToBottom() {
    if (mainElement) {
      mainElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  function accessOtherAccount() {
    signOutWithGoogle();
  }

  return(
    <div id="page-auth">
      <aside>
        <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
        <strong>Crie salas de Q&amp;A ao-vivo</strong>
        <p>Tire as dúvidas da sua audiência em tempo-real</p>
        <div id="arrow-down-icon" >
          <button onClick={scrollToBottom}>
            <img src={arrowDownImg} alt="Role a página"  />
          </button>
        </div>
      </aside>
      <main ref={(el) => setMainElement(el)}>
        <div className="main-content">
          <img src={logoImg} alt="Letmeask" />
          { user ? (
            <button onClick={handleCreateRoom} className="create-my-room">
              <img id="avatar" src={user.avatar} alt={user.name} />
              Crie sua sala
            </button>
          ) : (
            <button onClick={handleCreateRoom} className="create-room">
              <img src={googleIconImg} alt="Logo do Google" />
              Crie sua sala com o Google
            </button> ) 
          }
          <div className="separator">ou entre em uma sala</div>
          <form onSubmit={handleJoimRoom}>
            <input 
              type="text"
              placeholder="Digite o código da sala"
              onChange={event => setRoomCode(event.target.value)}
            />
            <Button type="submit">
              Entrar na sala
            </Button>
            { user ?  <button className="other-account" onClick={accessOtherAccount}>Entre com outra conta</button> : <></>}
          </form>
        </div>
      </main>
      <Toaster />
    </div>
  )
}