import { Injectable } from '@angular/core';
import {
  Database,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  set,
} from '@angular/fire/database';
import { firstValueFrom, Observable } from 'rxjs';
import { HighScore } from '../Interfaces/highScore';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private highScoresRef = ref(this.db, 'highscores');

  constructor(private db: Database) {}

  /**
   * Method to add a high score if it qualifies within the top 200
   * @param name Player name
   * @param score Player score
   * @returns
   */
  async addHighScore(name: string, score: number): Promise<void> {
    // Check for invalid name or score
    if (!name || name.trim() === '' || score === null || score === undefined) {
      return;
    }

    // Query to get the top 200 scores
    const topScoreQuery = query(
      this.highScoresRef,
      orderByChild('score'),
      limitToLast(200),
    );

    try {
      // Fetch the top 200 scores
      const topScoresSnapshot = await firstValueFrom(
        new Observable((observer) => {
          onValue(topScoreQuery, (snapshot) => {
            observer.next(snapshot);
          });
        }),
      );

      // Handle empty database scenario
      // @ts-expect-error we don't need to know the type here
      if (!topScoresSnapshot.exists()) {
        const newScoreRef = push(this.highScoresRef);
        const timestamp = Date.now();
        await set(newScoreRef, { name, score, timestamp });
        return;
      }

      const topScores: HighScore[] = [];
      // Process each snapshot entry
      // @ts-expect-error we don't need to know the type here
      topScoresSnapshot.forEach((childSnapshot) => {
        const scoreData = childSnapshot.val() as HighScore;
        topScores.push(scoreData);
      });

      // Sort scores in descending order of score
      topScores.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);

      // Check if the player already has a higher or equal score in the top 200
      const existingEntry = topScores.find(
        (entry) => entry.name === name && entry.score >= score,
      );
      if (existingEntry) {
        return;
      }

      // Check if the new score qualifies for the top 200
      if (
        topScores.length < 200 ||
        score > topScores[topScores.length - 1].score
      ) {
        const newScoreRef = push(this.highScoresRef); // Generate a unique reference
        const timestamp = Date.now();

        await set(newScoreRef, { name, score, timestamp });
      } else {
        console.log(
          `Score not added. Score of ${score} does not qualify for the top 200.`,
        );
      }
    } catch (error) {
      console.error('Error fetching or processing top scores:', error);
    }
  }

  /**
   * Method to get high scores in real time
   **/
  getHighScores(): Observable<HighScore[]> {
    return new Observable((observer) => {
      onValue(
        this.highScoresRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            observer.next([]);
            return;
          }

          const scores: HighScore[] = [];
          snapshot.forEach((childSnapshot) => {
            const scoreData = childSnapshot.val() as HighScore;
            scores.push(scoreData);
          });

          // Sort scores in descending order by score and ascending by timestamp for ties
          scores.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
          observer.next(scores.slice(0, 200)); // Emit top 200 scores
        },
        (error) => {
          console.error('Error fetching data from Firebase:', error);
          observer.error(error);
        },
      );
    });
  }
}
