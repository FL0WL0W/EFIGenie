#define IAfrServiceExists
namespace EngineManagement
{
	class IAfrService
	{
	public:
		virtual float GetAfr() = 0;
	};
	extern IAfrService *CurrentAfrService;
	IAfrService* CreateAfrService(void *config);
}