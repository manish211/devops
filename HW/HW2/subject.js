
function inc(p, q){
   /* istanbul ignore else  */ 
   if(q ==undefined) q =1;
   
   /* istanbul ignore else  */ 
   if( p < 0 )
   {
   	p = -p;
   }
   return p + q/q;
}

exports.inc = inc
