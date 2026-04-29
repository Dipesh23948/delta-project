const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup"); 
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body; 

        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        console.log(registeredUser);

        req.login(registeredUser,(err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            return res.redirect("/listings"); 
    
        });

    } catch (err) {
        next(err);
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login"); 
};

module.exports.login = (req,res) => {   
    req.flash("success", "Welcome bcak to wanderlust! ");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out now");
        res.redirect("/listings"); 
    });
};