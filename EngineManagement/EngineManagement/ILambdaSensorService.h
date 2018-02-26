#define ILambdaSensorServiceExists
namespace EngineManagement
{
	class ILambdaSensorService
	{
		virtual void ReadLambda() = 0;
		float Lambda[MAX_CYLINDERS];
	};
}