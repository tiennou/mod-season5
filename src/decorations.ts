import { RoomName, ServerConfig } from "typed-screeps-server";

export default function(config: ServerConfig) {
  const { backend } = config;
  if (backend) {
    function getDecorations(location: { room: RoomName, shard: string }) {
      const wall = {
        "active": {
          "foregroundColor": "#CFAD01",
          "foregroundAlpha": 0.15,
          "foregroundBrightness": 1.0,
          "backgroundColor": "#AB8812",
          "backgroundBrightness": 0.3,
          "strokeColor": "#A38A23",
          "strokeBrightness": 0.5,
          "strokeLighting": 0.1,
          "strokeWidth": 10,
          "world": true,
          "room": location.room,
          "shard": "",
        },
        "decoration": {
          "graphics": [],
          "type": "wallLandscape",
          "name": "Seasonal wall",
          "foregroundUrl": `${config.assetsUrl}wall.png`
        }
      };
      const floor = {
        "active": {
          "floorBackgroundColor": "#CDA418",
          "floorBackgroundBrightness": 0.7,
          "floorForegroundColor": "#F3C300",
          "floorForegroundAlpha": 0.1,
          "floorForegroundBrightness": 1.0,
          "swampColor": "#4A8200",
          "swampStrokeColor": "#513F02",
          "swampStrokeWidth": 30,
          "roadsColor": "#C2B271",
          "roadsBrightness": 0.8,
          "world": true,
          "room": location.room,
          "shard": "",
        },
        "decoration": {
          "graphics": [],
          "type": "floorLandscape",
          "name": "Seasonal floor",
          "floorForegroundUrl": `${config.assetsUrl}floor.png`,
          "tileScale": 2
        }
      };
      if(location.shard) {
        wall.active.shard = location.shard;
        floor.active.shard = location.shard;
      }
      
      return [floor, wall];
    };
    
    backend.on('expressPostConfig', function(app) {
      backend.router.get('/game/room-decorations', (request, response) => {
        const decorations = getDecorations(request.query as { room: RoomName, shard: string });
        console.log(`Decorations get`);
        response.json({ ok: 1, decorations });
      });
    });
  }
}
