const authorizeRole = role => (req, res, next) => {
    if (req.user.role != role) return res.redirect('/profile');
    next();
}
export default authorizeRole;
