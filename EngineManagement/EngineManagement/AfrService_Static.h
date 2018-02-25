#if defined(IAfrServiceExists)
#define AfrService_StaticExists
namespace EngineManagement
{
	class AfrService_Static : public IAfrService
	{
	public:
		AfrService_Static(float afr) { Afr = afr; }
		float Afr;
		float GetAfr() { return Afr; }
	};
}
#endif