import {BehaviorSubject} from "rxjs";

class GameState {

    selectedAbilityIndex$ = new BehaviorSubject<number>(0);

    reset() {
    }

}

export const gameState = new GameState();