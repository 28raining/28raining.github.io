var a=[], b=[], op=[], res=[], tnum;

// to test multiplier
tnum=0; a[tnum]="R1"; b[tnum]="R2"; op[tnum]='x'; res[tnum]="R1R2";
tnum=1; a[tnum]="R1"; b[tnum]="R2/R1"; op[tnum]='x'; res[tnum]="R2";
tnum=1; a[tnum]="R1"; b[tnum]="R1/R2"; op[tnum]='x'; res[tnum]="R1R1/R2";
tnum=1; a[tnum]="R1"; b[tnum]="R1+R2/R1"; op[tnum]='x'; res[tnum]="R1R1+R2";

