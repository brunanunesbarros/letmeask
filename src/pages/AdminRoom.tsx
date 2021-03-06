import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router';

import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { Question } from '../components/Question';
import { database } from '../services/firebase';

import { useRoom } from '../hooks/useRoom';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';  

import '../styles/room-admin.scss';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const params = useParams<RoomParams>();
  const roomId = params.id;
  const history = useHistory();
  const { user } = useAuth();
  const { questions, title, authorId } = useRoom(roomId);

  useEffect(() => {
    if (authorId === null || authorId === undefined) {
      toast.error('Esta sala não tem autor!')
    } else {
      if (user?.id !== undefined && authorId !== '') {
        if (authorId !== user?.id) {
          toast.error('Você não é o administrador da sala!')
          history.push('/');
        }
      }
    }

  }, [authorId, history, user])

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    })
    history.push('/');  
  }

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    } 
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    });
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    });
  }

  function backToHome() {
    history.push('/');
  }

  return(
    <div id="page-admin-room">
      <header>
        <div className="content"> 
          <img onClick={backToHome} src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId}/>
            <Button isOutlined onClick={handleEndRoom}>Encerrar Sala</Button>
          </div>
        </div>
      </header>
      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          { questions.length > 0 && <span>{questions.length} perguntas(s)</span> }
        </div>
        <div className="question-list">
          {questions.map(question => {
            return (
              <Question
                key={question.id}  
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                { !question.isAnswered && (
                  <>
                    <button 
                      type="button"
                      onClick={() => handleCheckQuestionAsAnswered(question.id)}
                    >
                      <img src={checkImg} alt="Marcar pergunta como respondida" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleHighlightQuestion(question.id)}
                    >
                      <img src={answerImg} alt="Dar destaque a pergunta" />
                    </button>
                  </> 
                )}
                <button 
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover a pergunta" />
                </button>
              </Question>
            )
          })}
        </div>
      </main>
      <Toaster />
    </div>
  )
}