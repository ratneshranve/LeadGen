const User = require("../../models/User.model");
const ApiError = require("../../utils/apiError");
const { UserQueryBuilder } = require("../../utils/queryBuilder");
const uploadService = require("../uploads/upload.service");

class UserService {
  async getAllUsers(queryString) {
    const qb = new UserQueryBuilder(User.find(), queryString);
    const filter = qb.buildUserFilter();

    qb.modelQuery = User.find(filter);
    qb.search();
    qb.sort().paginate();

    const [users, total] = await Promise.all([
      qb.modelQuery,
      User.countDocuments(filter),
    ]);

    return { users, pagination: qb.paginationMeta(total) };
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async createUser(userData) {
    const existing = await User.findOne({
      $or: [{ email: userData.email }, { phone: userData.phone }],
    });

    if (existing) {
      throw new ApiError(400, "User with this email or phone already exists");
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      passwordHash: userData.password,
      role: userData.role || "salesperson",
    });

    return await User.findById(user._id);
  }

  async updateUser(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    return updatedUser;
  }

  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    return true;
  }

  async updateUserAvatar(userId, file) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!file) {
      throw new ApiError(400, "Please upload an avatar image file");
    }

    const uploadResult = await uploadService.replaceAsset(
      user.avatarPublicId,
      file,
      "appzeto/avatars",
      true
    );

    user.avatarUrl = uploadResult.url;
    user.avatarPublicId = uploadResult.publicId;
    await user.save();

    return user;
  }
}

module.exports = new UserService();
