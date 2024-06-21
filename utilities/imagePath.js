const imagePath = (req) => {
  const imagePath = 'public/images/users';
  const fullPath = `${req.protocol}://${req.get('host')}/${imagePath}`;
  return fullPath;
};

export default imagePath;
