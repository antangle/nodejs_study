import config from "../config";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { prisma } from "../generated/prisma-client";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt_secret,
};

const verifyUser = async (payload, done) => {
  try {
    // passport 가 startegy 를 통해서 유저를 찾은다음에 payload에 id 담아서 준다.
    const user = await prisma.user({ id: payload });
    // 그 id 를 통해서 prisma 로 DB 조회해보고 있으면 error 없는 done 을 넘겨준다.
    if (user !== null) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
};

// passport authenticate middleware
export const authenticateJwt = (req, res, next) =>
  passport.authenticate("jwt", { sessions: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);

passport.use(new Strategy(jwtOptions, verifyUser));
passport.initialize();
