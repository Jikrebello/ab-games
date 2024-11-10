import { Routes } from '@angular/router';
import { FloppyFishSceneComponent } from './floppyfish/floppy-fish-scene/floppy-fish-scene.component';
import { LeaderboardComponent } from './shared/leaderboard/leaderboard.component';

export const routes: Routes = [
  { path: '', component: FloppyFishSceneComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
];
