const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('./models/post') // Supondo que este seja o seu modelo de usuário

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Usuário não encontrado' });
        }
        if (!user.verifyPassword(password)) {
          return done(null, false, { message: 'Senha incorreta' });
        }
        return done(null, user);
      });
    }
  ));

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'senha'
}, async (email, senha, done) => {
    try {
        const user = await User.findOne({ where: { email: email } })
        if (!user) {
            return done(null, false, { message: 'Email não encontrado' })
        }

        const isMatch = await bcrypt.compare(senha, user.senha)
        if (!isMatch) {
            return done(null, false, { message: 'Senha incorreta' })
        }

        return done(null, user)
    } catch (error) {
        return done(error)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id)
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

module.exports = passport
