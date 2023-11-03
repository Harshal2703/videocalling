import { NextResponse } from "next/server"
const { RtcTokenBuilder, RtcRole } = require('agora-token')


const generateToken = (uid, channelName) => {
    const appId = '98c5588fc2e0418d92c681bfebe81ac4';
    const appCertificate = '7c2eb96272ed4d4384b7b477e3e8070e';
    // const channelName = 'fueheuew2e92emis-2kmwm20';
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 1200
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const tokenA = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs);
    return tokenA
}

export async function POST(req) {
    const { userId, channelName } = await req.json()
    if (userId && channelName) {
        const tokenGenerated = generateToken(userId, channelName)
        return NextResponse.json({ "token": tokenGenerated }, { status: 200 })
    }
    return NextResponse.json({ "message": 'err' }, { status: 400 })
}