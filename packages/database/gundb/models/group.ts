import { v4 as uuid } from 'uuid';
import logger from '@chatpuppy/utils/logger';
import { gun } from "../initGundb";
import { UserDocument } from './user';

const Group = {
    async createGroup(group: GroupDocument) {
        // let current_group: GroupDocument | null = null
        group.uuid = uuid()
        group.createTime = new Date().toString()
        gun.get('groups').get(group.name).put({
            _id: group.uuid,
            uuid: group.uuid,
            name: group.name,
            avatar: group.avatar,
            isDefault: false,
            members: group.members,
            createTime: group.createTime,
            creator: group.creator
        }, (ack) => {

        })
        return group
    },

    async save(group: GroupDocument) {
        const members = group.members as string
        if (group.isDefault) {
            // @ts-ignore
            gun.get('groups').get('defaultGroup').get('members').put(members)
        }else {
            gun.get('groups').get(group.name).set(group, ack => {
            })
        }
    },


    createDefaultGroup(group: GroupDocument) {
        const linkId = uuid();
        const members = '';
        let defaultGroup = {} as GroupDocument
        gun.get('groups').get("defaultGroup").on((data) => {
            defaultGroup = data
        })



        gun.get('groups').get('defaultGroup').put({
            _id: linkId,
            uuid: linkId,
            name: group.name,
            avatar: group.avatar,
            isDefault: group.isDefault,
            createTime: new Date().toString(),
            members
        }, ack => {
        })
        group.uuid = linkId
        group._id = linkId
        defaultGroup = group
        
        return defaultGroup
    },

    async get(to: string) {
        let group =  {} as GroupDocument
        gun.get('groups').get('defaultGroup').map().on((data, key) => {
            group = data
        })
        return group
    },

    async getGroupByUuid(uuid: string) {
        let group = {} as GroupDocument
        await gun.get('groups').map().on((data, key) => {
            if (data.uuid === uuid){
                group = data
            }
        })
        return group
    },
    
    async getDefaultGroup() {
        let defaultGroup = {} as GroupDocument
        await gun.get('groups').get("defaultGroup").once((data) => {
            if (data){
                defaultGroup = data as GroupDocument
            }
            logger.info(data)
        })
        return defaultGroup
    },

    async countGroup(uuid: string) {
        let count = 0
        gun.get('groups').on((data, key) => {
            if (data.creator === uuid) {
                count ++
            }
        })
        return count
    },

    async checkName(name: string) {
        const groupList = [] as string[]
        gun.get('groups').map(group => group.name == name ? group : undefined).on((group) =>  {
            groupList.push(group.name)
        })
        if (groupList.length > 0) {
            return true
        }
        return false
    },

    async getGroupByMember(user: UserDocument) {
        const groupList: GroupDocument[] = []
        let check_group = ''
        await gun.get('groups').map( async group => {
            if (group.hasOwnProperty('members')&& typeof group.members == "string" && group.members.includes(user.uuid) && typeof group.uuid !== 'undefined') {
                if (!check_group.includes(group.uuid)){
                    check_group = check_group + ',' + group.uuid
                    group._id = group.uuid
                    groupList.push(group)

                }

            }else {

            }
        })
        await delay(500)
        logger.info("check_group", check_group)

        return groupList
    },

    async getGroupName(name: string) {
        const groupList: GroupDocument[] = []
        gun.get('groups').map( async group => {
            if (group.hasOwnProperty('name') && group.name.includes(name)) {
                groupList.push(group)
            }
        })
        return groupList
    }
}

export interface GroupDocument extends Document {
    _id: string;
    uuid: string;
    /** GroupName */
    name: string;
    /** Avatar */
    avatar: string;
    /** Notice */
    announcement: string;
    /** Creator */
    creator: string;
    /** is Default Group */
    isDefault: boolean;
    /** members */
    members: string;
    /** createTime */
    createTime: string;
}

export default Group;

function delay(ms: number) {
    return new Promise((res, rej) => {
        setTimeout(res, ms);
    })
}