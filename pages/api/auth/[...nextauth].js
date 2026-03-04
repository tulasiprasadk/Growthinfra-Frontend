// This is a NextAuth.js configuration file for social login providers.
import NextAuth from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
import LinkedInProvider from 'next-auth/providers/linkedin';
import TwitterProvider from 'next-auth/providers/twitter';
import RedditProvider from 'next-auth/providers/reddit';

// Instagram: use generic OAuth provider (NextAuth does not have built-in Instagram)
const InstagramProvider = {
  id: 'instagram',
  name: 'Instagram',
  type: 'oauth',
  version: '2.0',
  authorization: 'https://api.instagram.com/oauth/authorize',
  token: 'https://api.instagram.com/oauth/access_token',
  userinfo: 'https://graph.instagram.com/me?fields=id,username',
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id,
      name: profile.username,
      email: null,
      image: null,
    };
  },
};

export default NextAuth({
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: '2.0',
    }),
    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
    }),
    InstagramProvider,
  ],
  // You can add callbacks, database, and session options here
});
