function fileTest(dir, filePath)
{
  if (!fs.existsSync(dir)){

        return false;
    }
    
    var files = fs.readdirSync(dir);
    if( files.length == 0 )
    {
        return false;
    }

   if( fs.existsSync(filePath ))
   {
    var buf = fs.readFileSync(filePath, "utf8");
    if( buf.length > 0 )
    {
      return true;
    }
    return false;
  }
}
