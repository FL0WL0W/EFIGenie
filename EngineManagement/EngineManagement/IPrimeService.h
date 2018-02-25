#define IPrimeServiceExists
namespace EngineManagement
{
	class IPrimeService
	{
	public:
		virtual void Prime() = 0;
		virtual void Tick() = 0;
	};

	extern IPrimeService *CurrentPrimeService;

	IPrimeService* CreatePrimeService(void *config);
}