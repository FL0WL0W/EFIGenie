#define IIdleControlServiceExists
namespace EngineManagement
{
	class IIdleControlService
	{
	public:
		unsigned short RpmError;
		virtual void Tick() = 0;
	};

	extern IIdleControlService *CurrentIdleControlService;

	IIdleControlService* CreateIdleControlService(void *config);
}