const { Strategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport');
import Database from '../db/Database';
import { ObjectId } from 'mongodb';
const config = require('../config');

interface JwtPayload {
    id: string;
    exp?: number;
}

export default function () {
    const strategy = new Strategy(
        {
            secretOrKey: config.JWT.SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (
            payload: JwtPayload,
            done: (error: any, user?: any) => void
        ) => {
            try {
                const db = Database.getDb();
                const users = db.collection('users');

                const user = await users.findOne({ _id: new ObjectId(payload.id) });

                if (!user) return done(null, false);

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    );

    passport.use(strategy);

    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate('jwt', { session: false }),
    };
}
