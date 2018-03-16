#define IIdleAirControlValveServiceExists
namespace EngineManagement
{
	class IIdleAirControlValveService
	{
	public:
		virtual void SetArea(float area) = 0;
	};

	extern IIdleAirControlValveService *CurrentIdleAirControlValveService;

	IIdleAirControlValveService* CreateIdleAirControlValveService(void *config);
}