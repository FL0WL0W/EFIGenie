#define ILambdaSensorServiceExists
namespace EngineManagement
{
	class ILambdaSensorService
	{
	public:
		virtual void ReadLambda() = 0;
		float Lambda[MAX_CYLINDERS];
	};

	extern ILambdaSensorService *CurrentLambdaSensorService;

	ILambdaSensorService* CreateLambdaSensorService(void *config);
}