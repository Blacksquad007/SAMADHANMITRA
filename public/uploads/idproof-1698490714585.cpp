// You are using GCC
#include<iostream>
using namespace std;
bool issafe(int a,int b,int chess[][100],int n)
{
    if(a>=0 && a<n && b>=0 && b<n && chess[a][b]==-1)
    {
        return true;
    }
    return false;
}
bool knight(int a,int b,int n,int count,int chess[][100],int x[],int y[])
{
    if(count==n*n)
    {
        return true;
    }
    for(int i=0;i<8;i++)
    {
        int p=a+x[i];
        int q=b+y[i];
        if(issafe(p,q,chess,n))
        {
            chess[p][q]=count;
            if(knight(p,q,n,count+1,chess,x,y))
            {
                return true;
            }
            else
            {
                chess[p][q]=-1;
            }
        }
    }
    return false;
}
int main()
{
    int n;
    cin>>n;
    if(n<0||n>8)
    {
        cout<<"N should be between 1 and 8.";
        return 0;
    }
    int chess[n][100];
    for(int i=0;i<n;i++)
    {
        for(int j=0;j<n;j++)
        {
            chess[i][j]=-1;
        }
    }
    chess[0][0]=0;
    int x[]={2,1,-1,-2,-2,-1,1,2};
    int y[]={1,2,2,1,-1,-2,-2,-1};
    if(knight(0,0,n,1,chess,x,y))
    {
        cout<<"Solution exists: "<<endl;
        for(int i=0;i<n;i++)
        {
            for(int j=0;j<n;j++)
            {
                cout<<chess[i][j]<<" ";
            }
            cout<<endl;
        }
    }
    else
    {
        cout<<"No solution exists.";
    }
}