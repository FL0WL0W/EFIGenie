#define IStepperServiceExists
namespace EngineManagement
{
	class IStepperService
	{
	public:
		virtual void Step(int steps);
	};

	IStepperService* CreateStepperService(void *config);
}