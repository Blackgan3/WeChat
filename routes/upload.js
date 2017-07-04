
/**
 * Created by Administrator on 2017/7/4.
 */

exports.upload = function(req,res){
    console.log(req.files);
    var patharray = req.files.file.path.split('\\');
    res.send(patharray[patharray.length-1]);
}