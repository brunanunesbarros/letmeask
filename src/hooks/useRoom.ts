import { useState, useEffect } from 'react';

import { database } from '../services/firebase';

import { useAuth } from '../hooks/useAuth';

type FirebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likes: Record<string, {
    authorId: string;
  }>
}>

type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likeCount: number;
  likeId: string | undefined;
}

export function useRoom(roomId: string) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [title, setTitle] = useState('');
  const [endedAt, setEndedAt] = useState(null);
  const [authorId, setAuthorId] = useState('');

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
  
      roomRef.on('value', room => {
        const databaseRoom = room.val();
        
        const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

        let parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
          return {
            id: key,
            content: value.content,
            author: value.author,
            isHighlighted: value.isHighlighted,
            isAnswered: value.isAnswered,
            likeCount: Object.values(value.likes ?? {}).length,
            likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
            }
        })

        parsedQuestions = parsedQuestions.sort((a: any, b: any) => {
          if (a.isAnswered) { 
            return 1;
          } else if (b.isAnswered) {
            return -1;
          } else if (a.likeCount < b.likeCount) {
            return 1;
          } else if (b.likeCount < a.likeCount) {
            return -1;
          } else {
            return 0;
          }
        })

      setTitle(databaseRoom.title);
      setQuestions(parsedQuestions);
      setEndedAt(databaseRoom.endedAt);
      setAuthorId(databaseRoom.authorId);
    })

    return () => {
      roomRef.off('value');
    }
  }, [roomId, user?.id])

  return { questions, title, endedAt, authorId }
}