import type { ParameterizedContext } from "koa";
import Joi from "joi";
import bcrypt from "bcrypt";

import User from "@models/user";

interface State {
  user: {
    _id: string;
  };
}

interface UserSchama {
  username: string;
  password: string;
  name: string;
}

class UserController {
  /**
   * 使用 bcrypt 对用户密码进行加密
   * @param password
   * @returns
   */
  private _hashingPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  };

  /** 新增用户 */
  createUser = async (ctx: ParameterizedContext) => {
    const schema = Joi.object<UserSchama>({
      username: Joi.string().required(),
      password: Joi.string().required(),
      name: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);
    if (result.error) {
      ctx.throw(422, result.error);
    }

    const value = result.value as UserSchama;

    // 检查用户名是否已经存在
    const isExist = await User.findOne({
      username: value.username,
    }).exec();
    if (isExist) {
      ctx.throw(409, "用户已存在");
    }

    await new User(
      Object.assign({}, value, {
        password: await this._hashingPassword(value.password),
      })
    ).save();

    ctx.status = 204;
  };

  /** 获取当前登录用户的信息 */
  getAuthenticatedUserInfo = async (ctx: ParameterizedContext<State>) => {
    const userId = ctx.state.user._id as string;
    const userInfo = await User.findById(userId);
    if (userInfo) {
      ctx.body = userInfo;
    } else {
      ctx.throw(404, "未查询到当前登录用户信息");
    }
  };

  /** 更改当前用户信息 */
  updateAuthenticatedUserInfo = async (ctx: ParameterizedContext<State>) => {
    const userId = ctx.state.user._id as string;
    interface Schema {
      password?: string;
      name?: string;
    }
    const schema = Joi.object<Schema>({
      name: Joi.string(),
      password: Joi.string(),
    });
    const validateResult = schema.validate(ctx.request.body);
    if (validateResult.error) {
      ctx.throw(422, validateResult.error);
    }

    const userData = await User.findByIdAndUpdate(userId, validateResult.value);
    if (userData) {
      ctx.status = 204;
    } else {
      ctx.throw(404, "用户不存在");
    }
  };

  /** 删除当前认证用户 */
  deleteAuthenticatedUser = async (ctx: ParameterizedContext<State>) => {
    const user = await User.findByIdAndRemove(ctx.state.user._id);
    if (user) {
      ctx.status = 204;
    } else {
      ctx.throw(404, "用户不存在");
    }
  };
}

export default new UserController();
