import { v4 as uuid } from 'uuid';
import logger from "@chatpuppy/utils/logger";
import { gun } from "../initGundb";

const  Friend = {
    async addFriend(friend: FriendDocument) {
        const linkId = uuid()
        friend.uuid = linkId
        gun.get('friends').get(linkId).put(friend)
        return friend
    },

    async changeName(uuid: string, nickname: string, userId: string) {
        gun.get('friends').map( async friend => {
            if (friend.from == userId && friend.to == uuid) {
                // @ts-ignore
                gun.get('friends').get(friend.uuid).get('nickname').put(nickname)
            }
        })
    },

    async get(to: string, from: string) {
        const friends = [] as FriendDocument[]
        gun.get('friends').map().on(data => {
            logger.info(data)
            if(data) {
                if (data.to === to && data.from === from) {
                    friends.push((data))
                }
            }

        })
        return friends
    },

    async getByFrom(from: string) {
        const friends = [] as FriendDocument[]

        gun.get('friends').map(async friend => {
            if ( friend.hasOwnProperty('from') && friend.from === from) {
                friend._id = friend.uuid
                friends.push(friend)
                logger.info(friend)
            }
        })
        await delay(500)
        return friends
    },

    async getUuid(uuid: string) {
        let friend = {} as FriendDocument;
        await gun.get('friends').get(uuid).once(data => {
            friend = data as FriendDocument
        })
        return friend
    }
}

export interface FriendDocument extends Document {
    uuid: string;
    from: string;
    to: string;
    createTime: string;
    name: string;
    nickname: string;
}

export default Friend;

function delay(ms: number) {
    return new Promise((res, rej) => {
        setTimeout(res, ms);
    })
}