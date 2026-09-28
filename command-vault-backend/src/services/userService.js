const userRepo = require('../repositories/userRepository');
class UserService {
  async login(username, password) {
    const user = await userRepo.findByUsername(username);
    if(user && user.password === password) return user;
    return null;
  }
  async getAllUsers() { return await userRepo.findAll(); }
  async createUser(data) { return await userRepo.create(data); }
  async updateUser(id, data) { return await userRepo.update(id, data); }
  async deleteUser(id) { return await userRepo.delete(id); }
}
module.exports = new UserService();