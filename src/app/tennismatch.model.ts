export interface TennisMatch {
  
  newResult: string;
    id: any;
    week: string;
    home_player: string;
    away_player: string;
    result: string;
    league_id:number;
    deadline: Date;
}
export interface leagues {
 league_id:number;
 id:number;
 name:string;
 tier:number;
}