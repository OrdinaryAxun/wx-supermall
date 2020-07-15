// pages/cart/index.js

import {getSetting,chooseAddress,openSetting,showModal,showToast} from "../../utils/asyncWx.js";

import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data:{
    address:{},
    cart:[],
    allChecked:false,
    totalPrice:0,
    totalNum:0
  },

  onShow(){
    //1 获取缓存中收货地址信息
    const address = wx.getStorageSync("address");
    //1 获取缓存中的购物车数据
    const cart = wx.getStorageSync("cart") || [];
    //1 计算全选
    //const allChecked = cart.length?cart.every(v => v.checked):false;

    this.setData({
      address
    })
    this.setCart(cart);
  },

  //点击获取收货地址
  async handleChooseAddress(){
    try {
      //1 获取权限 状态
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      //2 判断权限状态
      if(scopeAddress===false){
        //3 先诱导用户打开授权页面
        await openSetting();
      }

      //4 调用获去地址的api
      let address = await chooseAddress();
      address.all=address.provinceName+address.cityName+address.countyName+address.detailInfo;
      console.log(address);
      //5 存入发哦缓存中
      wx.setStorageSync("address", address);
      
    } catch (error) {
      console.log(error);
    }
  },

  //商品的选中
  handleItemChange(e){
    //1获取别修改的id
    const goods_id=e.currentTarget.dataset.id;
    //2 获取购物车数组
    let {cart} = this.data;
    //3 找到被修改的商品对象
    let index = cart.findIndex(v => v.goods_id===goods_id);
    //4 选中状态取反
    cart[index].checked = !cart[index].checked;
    //5 重新设置后缓存中和data中
    this.setCart(cart);
  },
  //设置购物车状态 重新计算 价格等等
  setCart(cart){
    //1 计算全选
    //const allChecked = cart.length?cart.every(v => v.checked):false;
    let allChecked=true;
    //1 总价格 总数量
    let totalPrice=0;
    let totalNum=0;
    cart.forEach(v => {
      if(v.checked){
        totalPrice += v.num*v.goods_price;
        totalNum += v.num;
      }else{
        allChecked=false;
      }
    })
    //判断数组为空
    allChecked = cart.length!=0?allChecked:false;
    this.setData({
      cart,
      allChecked,
      totalPrice,
      totalNum
    });
    wx.setStorageSync("cart", cart);
  },
  //全选反选事件
  handleItemAllCheck(){
    //1 获取data中的数据
    let {cart,allChecked} = this.data;
    //2 修改allChecked的值
    allChecked = !allChecked;
    //3 循环修改购物车数组
    cart.forEach(v => v.checked=allChecked);
    //4 把修改厚的值到data和缓存
    this.setCart(cart);
  },
  //商品数量编辑
  async handleItemNumEdit(e){
    //1 获取传递过来的数据
    //console.log(e);
    const {operation,id} = e.currentTarget.dataset;
    //2 获取购物车数组
    let {cart} = this.data;
    //3 找到需要修改的商品索引
    const index = cart.findIndex(v => v.goods_id===id);
    //4-1 判断是否要删除
    if(cart[index].num===1 && operation===-1){
      // wx.showModal({
      //   title: '提示',
      //   content: '崽子您是否要删除！',
      //   success: (res) => {
      //     if (res.confirm) {
      //       cart.splice(index,1);
      //       this.setCart(cart);
      //     } else if (res.cancel) {
      //       console.log('用户点击取消')
      //     }
      //   }
      // })

      const res =  await showModal({content:"崽子您确定要删除？"});
      if (res.confirm) {
        cart.splice(index,1);
        this.setCart(cart);
      }
    }else{
      //4 进行修改数量
      cart[index].num += operation;
      //5 设置回缓存和data中
      this.setCart(cart);
    }
    
  },

  //空购物车弹窗
  async handleEmpty(){
    await showModal({content:"东西都不买还乱点什么点？"});
  },
  //点击了结算的功能
  async handlePay(){
    //判断收货地址
    const {address,totalNum} = this.data;
    if(!address.userName){
      await showToast({title:"您还没有选择收货地址"});
      return;
    }
    //2 判断用户选择商品
    if(totalNum===0){
      await showToast({title:"您还没有选购商品"})
      return;
    }
    //跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }
})