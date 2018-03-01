#define ILambdaSensorServiceExists
namespace EngineManagement
{
	class ILambdaSensorService
	{
	public:
		virtual void ReadLambda() = 0;
		float Lambda;
	};

	ILambdaSensorService* CreateLambdaSensorService(void *config);
}