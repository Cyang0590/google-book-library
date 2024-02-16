// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {

          if (context.user) {

            return User.findOne({ _id: context.user._id })

        
          }
          throw new AuthenticationError;
        },
    },

    Mutation: {
      addUser: async (parent, { username, email, password }) => {
        console.log("Signup",username,email,password)
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        console.log("Login",user)
  
        if (!user) {
          throw AuthenticationError;
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw AuthenticationError;
        }
  
        const token = signToken(user);
        console.log("token",token)
        return { token, user };
      },  

        saveBook: async (parent, { input }, context) => {
          console.log("Save book",context.user,input)
          if(context.user) {
            return User.findOneAndUpdate(
              { _id: context.user._id },
              { $addToSet: { savedBooks: input } },
              {
                new: true,
                runValidators: true
              }
            );
          }
          throw AuthenticationError;
        },
        
        removeBook: async (parent, { bookId }, context) => {
          if (context.user) {
            return User.findOneAndUpdate(
              { _id: context.user._id },
              {
                $pull: {
                  savedBooks: {
                    bookId: bookId
                  }
                }
              },
              { new: true }
            );
          }
          throw AuthenticationError;
        },
        
    }
};

module.exports = resolvers;

