import { Routes } from '@angular/router';
import { FloppyFishSceneComponent } from './floppy-fish-scene/floppy-fish-scene.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

export const routes: Routes = [
  { path: '', component: FloppyFishSceneComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
];
